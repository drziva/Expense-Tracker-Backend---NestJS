import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsOrder, FindOptionsWhere, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { Income } from './incomes.entity';
import { CreateIncomeDto } from './dto/create-income.dto';
import { DeleteIncomeResponse, GetIncomeResponse, IncomeResponse } from './dto/incomes-responses.dto';
import { IncomeQueryOptions } from './incomes.types';
import { IncomeGroup } from 'src/income-groups/income-groups.entity';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Injectable()
export class IncomesService {
    constructor(
        @InjectRepository(Income)
        private readonly incomeRepo: Repository<Income>,
        @InjectRepository(IncomeGroup)
        private readonly groupRepo: Repository<IncomeGroup>
    ) {}

    async create(dto: CreateIncomeDto, userId: number): Promise<IncomeResponse> {
        try {
            const group = await this.groupRepo.findOne({ where: { id: dto.groupId, user_id:userId }});
            if (!group) throw new NotFoundException("Group not found");
            const income = this.incomeRepo.create({
                amount: dto.amount,
                description: dto.description,
                group_id:dto.groupId,
                user_id: userId,
            });
            const savedIncome = await this.incomeRepo.save(income);
            return this.toIncomeResponse(savedIncome);
        } catch (error) {
            console.error("Error creating group: ",error);
            throw error;
        }
    }
    
    async getFilteredIncomes(userId: number, options: IncomeQueryOptions): Promise<GetIncomeResponse> {
       const { where, order } = this.buildSortAndFilter(userId,options)
       const { page=1, limit=20 } = options;
        // Pagination
        const skip = (page - 1) * limit;
        const [data, total] = await this.incomeRepo.findAndCount({
            where,
            order,
            skip,
            take: limit,
            relations:["group"]
        });

        return {
            data: data.map((income) => this.toIncomeResponse(income)),
            page,
            limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getSummaryByDay(
        userId: number,
        from: Date,
        to: Date
        ): Promise<{ date: string; total: number }[]> {

        if (from.getTime() > to.getTime()) {
            throw new NotFoundException(
            "Invalid date range: 'from' date must be before 'to' date"
            );
        }

        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
            throw new NotFoundException("Invalid date format");
        }

        const result = await this.incomeRepo.query(
            `
            WITH RECURSIVE dates AS (
            SELECT DATE(?) AS day
            UNION ALL
            SELECT DATE_ADD(day, INTERVAL 1 DAY)
            FROM dates
            WHERE day < DATE(?)
            )
            SELECT
            dates.day AS date,
            COALESCE(SUM(income.amount), 0) AS total
            FROM dates
            LEFT JOIN incomes income
            ON DATE(income.created_at) = dates.day
            AND income.user_id = ?
            GROUP BY dates.day
            ORDER BY dates.day ASC
            `,
            [from, to, userId]
        );

        return result.map((row) => ({
            date: row.date.toISOString().split("T")[0],
            total: Number(row.total),
        }));
    }

    async getSummaryByMonth(
        userId: number,
        from: Date,
        to: Date
        ): Promise<{ date: string; total: number }[]> {

        if (from.getTime() > to.getTime()) {
            throw new NotFoundException(
            "Invalid date range: 'from' date must be before 'to' date"
            );
        }

        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
            throw new NotFoundException("Invalid date format");
        }

        const result = await this.incomeRepo.query(
            `
            WITH RECURSIVE months AS (
            SELECT DATE_FORMAT(DATE(?), '%Y-%m-01') AS month_start
            UNION ALL
            SELECT DATE_ADD(month_start, INTERVAL 1 MONTH)
            FROM months
            WHERE month_start < DATE_FORMAT(DATE(?), '%Y-%m-01')
            )
            SELECT
            months.month_start AS date,
            COALESCE(SUM(income.amount), 0) AS total
            FROM months
            LEFT JOIN incomes income
            ON DATE_FORMAT(income.created_at, '%Y-%m-01') = months.month_start
            AND income.user_id = ?
            GROUP BY months.month_start
            ORDER BY months.month_start ASC
            `,
            [from, to, userId]
        );

        return result.map((row) => ({
            date: row.date,
            total: Number(row.total),
        }));
    }

    async getFilteredForPdf(userId, options): Promise<IncomeResponse[]> {
        const {where, order} = this.buildSortAndFilter(userId,options);
        const expenses = await this.incomeRepo.find({where, order, relations:["group"]});

        return expenses.map(exp => this.toIncomeResponse(exp));
    }

    async getIncomeById(id: number, userId: number): Promise<IncomeResponse> {
        const income = await this.incomeRepo.findOne({
            where: { id, user_id: userId },
            relations:["group"]
        });
        if (!income) {
            throw new NotFoundException("Income not found");
        }
        return this.toIncomeResponse(income);
    }

    async updateIncomeById(id: number, userId: number, dto: UpdateIncomeDto): Promise<IncomeResponse> {
        try{
            const income = await this.incomeRepo.findOne({ where: { id, user_id:userId } });
                if (!income) {
                    throw new NotFoundException("Income not found");
            }
            if(dto.groupId) {
                const group = await this.groupRepo.findOne({where:{id:dto.groupId, user_id:userId}})
                if(!group){
                    throw new NotFoundException("Group not found");
                }
                income.group_id = dto.groupId;
            }
            income.amount = dto.amount;
            income.description = dto.description;

            const updatedIncome = await this.incomeRepo.save(income);
            return this.toIncomeResponse(updatedIncome)
        } catch(error){
            console.error("Error updating income: ",error);
            throw error;
        }
    }

    async deleteIncomeById(id: number, userId: number): Promise<DeleteIncomeResponse> {
        try {
            const result = await this.incomeRepo.delete({ id, user_id: userId });

            return {
                success: (result.affected ?? 0) > 0,
                id,
            };
        } catch (error) {
            console.error("Error deleting income: ",error);
            throw error;
        }
    }

    async getTotalIncomesValue(userId: number): Promise<number> {
        const incomes = await this.getAllIncomes(userId);
        return incomes.reduce((total,income) => total + Number(income.amount ?? 0), 0);
    }

    async getForReport(userId: number, from?: Date, to?: Date): Promise<Income[]> {
        const where: any = {user_id : userId}
        if(from && to){
            where.created_at = Between(from,to);
        } else if(from){
            where.created_at = MoreThanOrEqual(from);
        } else if(to){
            where.created_at = LessThanOrEqual(to);
        }
        return await this.incomeRepo.find({where});
    }

    private async getAllIncomes(userId: number): Promise<IncomeResponse[]> {
        const incomes = await this.incomeRepo.find({ where: { user_id: userId } });
        return incomes.map(income => this.toIncomeResponse(income));
    }

    private toIncomeResponse(income: Income): IncomeResponse {
        return {
            id: income.id,
            amount: Number(income.amount),
            description: income.description,
            createdAt: income.created_at,
            groupId: income.group_id,
            groupName: income.group?.name
        };
    }

    private buildSortAndFilter(userId:number, options: IncomeQueryOptions): {
        where: FindOptionsWhere<Income>,
        order: FindOptionsOrder<Income>
    } {
            const where: any = { user_id: userId};
            const { from, to, min, max, sort, search, group_id } = options;
            //Filtering
            if (group_id !== undefined) {
                where.group_id = group_id;
            }

            if (from && to) {
                const toDate = new Date(to);
                toDate.setDate(toDate.getDate() + 1);
                where.created_at = Between(from, toDate);
            } else if (from) {
                where.created_at = MoreThanOrEqual(from);
            } else if (to) {
                where.created_at = LessThanOrEqual(to);
            }

            if (min !== undefined && max !== undefined) {
                where.amount = Between(min, max);
            } else if (min !== undefined) {
                where.amount = MoreThanOrEqual(min);
            } else if (max !== undefined) {
                where.amount = LessThanOrEqual(max);
            }
            if (search) {
                where.description =  Like(`%${search}%`);
            }
            //Sorting
            let order: any = { created_at: 'DESC' }; // Default order
            switch(sort) {
                case 'amount_asc':
                    order = { amount: 'ASC' };
                    break;
                case 'amount_desc':
                    order = { amount: 'DESC' };
                    break;
                case 'date_asc':
                    order = { created_at: 'ASC' };
                    break;
                case 'date_desc':
                    order = { created_at: 'DESC' };
                    break;
            }

            return {where, order}
        }
}
