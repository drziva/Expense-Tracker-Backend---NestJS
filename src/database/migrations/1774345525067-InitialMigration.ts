import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1774345525067 implements MigrationInterface {
    name = 'InitialMigration1774345525067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`expenses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`description\` text NOT NULL, \`amount\` decimal(14,2) NOT NULL, \`user_id\` int NOT NULL, \`group_id\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`incomes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`description\` text NOT NULL, \`amount\` decimal(14,2) NOT NULL, \`user_id\` int NOT NULL, \`group_id\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`income_groups\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`description\` text NOT NULL, \`user_id\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`scheduled_transactions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`description\` varchar(255) NOT NULL, \`date\` datetime NOT NULL, \`type\` enum ('income', 'expense') NOT NULL, \`expense_group_id\` int NULL, \`income_group_id\` int NULL, \`processed\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`expense_groups\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`description\` text NOT NULL, \`user_id\` int NOT NULL, \`last_budget_alert\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`monthly_budget_cap\` decimal(14,2) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`reminders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`weekday\` int NULL, \`day_of_month\` int NULL, \`type\` enum ('weekly', 'monthly') NOT NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`user_id\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`firebase_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`token\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_ebd825be0e54d734c03add2ccc\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`refresh_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`token\` varchar(255) NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`expires_at\` timestamp NOT NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`budget_cap_notifications\` tinyint NOT NULL DEFAULT 0, \`premium\` tinyint NOT NULL DEFAULT 0, \`provider\` varchar(255) NULL, \`providerId\` varchar(255) NULL, \`is_welcomed\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`expenses\` ADD CONSTRAINT \`FK_49a0ca239d34e74fdc4e0625a78\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`expenses\` ADD CONSTRAINT \`FK_d4e9271763ee685f5d746a4e550\` FOREIGN KEY (\`group_id\`) REFERENCES \`expense_groups\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`incomes\` ADD CONSTRAINT \`FK_400664fad260d8fa50ecb78ffe6\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`incomes\` ADD CONSTRAINT \`FK_07298debafc364c25189d2c7b0d\` FOREIGN KEY (\`group_id\`) REFERENCES \`income_groups\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`income_groups\` ADD CONSTRAINT \`FK_937aa648d982493a3299ff38c6c\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`scheduled_transactions\` ADD CONSTRAINT \`FK_304ce6862ee674f77f0d4be1a84\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`scheduled_transactions\` ADD CONSTRAINT \`FK_cf1a1c8442688a161d236cf0369\` FOREIGN KEY (\`expense_group_id\`) REFERENCES \`expense_groups\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`scheduled_transactions\` ADD CONSTRAINT \`FK_2293b57b8bd91b1dc3d216131dd\` FOREIGN KEY (\`income_group_id\`) REFERENCES \`income_groups\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`expense_groups\` ADD CONSTRAINT \`FK_40778001e0d2b1a6a87e0db6855\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reminders\` ADD CONSTRAINT \`FK_586e0b8e419125be507701cee2a\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`firebase_tokens\` ADD CONSTRAINT \`FK_36ee72a1b403c86884e7dd02ce5\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` ADD CONSTRAINT \`FK_610102b60fea1455310ccd299de\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` DROP FOREIGN KEY \`FK_610102b60fea1455310ccd299de\``);
        await queryRunner.query(`ALTER TABLE \`firebase_tokens\` DROP FOREIGN KEY \`FK_36ee72a1b403c86884e7dd02ce5\``);
        await queryRunner.query(`ALTER TABLE \`reminders\` DROP FOREIGN KEY \`FK_586e0b8e419125be507701cee2a\``);
        await queryRunner.query(`ALTER TABLE \`expense_groups\` DROP FOREIGN KEY \`FK_40778001e0d2b1a6a87e0db6855\``);
        await queryRunner.query(`ALTER TABLE \`scheduled_transactions\` DROP FOREIGN KEY \`FK_2293b57b8bd91b1dc3d216131dd\``);
        await queryRunner.query(`ALTER TABLE \`scheduled_transactions\` DROP FOREIGN KEY \`FK_cf1a1c8442688a161d236cf0369\``);
        await queryRunner.query(`ALTER TABLE \`scheduled_transactions\` DROP FOREIGN KEY \`FK_304ce6862ee674f77f0d4be1a84\``);
        await queryRunner.query(`ALTER TABLE \`income_groups\` DROP FOREIGN KEY \`FK_937aa648d982493a3299ff38c6c\``);
        await queryRunner.query(`ALTER TABLE \`incomes\` DROP FOREIGN KEY \`FK_07298debafc364c25189d2c7b0d\``);
        await queryRunner.query(`ALTER TABLE \`incomes\` DROP FOREIGN KEY \`FK_400664fad260d8fa50ecb78ffe6\``);
        await queryRunner.query(`ALTER TABLE \`expenses\` DROP FOREIGN KEY \`FK_d4e9271763ee685f5d746a4e550\``);
        await queryRunner.query(`ALTER TABLE \`expenses\` DROP FOREIGN KEY \`FK_49a0ca239d34e74fdc4e0625a78\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`refresh_tokens\``);
        await queryRunner.query(`DROP INDEX \`IDX_ebd825be0e54d734c03add2ccc\` ON \`firebase_tokens\``);
        await queryRunner.query(`DROP TABLE \`firebase_tokens\``);
        await queryRunner.query(`DROP TABLE \`reminders\``);
        await queryRunner.query(`DROP TABLE \`expense_groups\``);
        await queryRunner.query(`DROP TABLE \`scheduled_transactions\``);
        await queryRunner.query(`DROP TABLE \`income_groups\``);
        await queryRunner.query(`DROP TABLE \`incomes\``);
        await queryRunner.query(`DROP TABLE \`expenses\``);
    }

}
