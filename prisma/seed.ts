import { fakerPT_PT as faker } from "@faker-js/faker";
import { db } from "@/database";
import { District } from "@/schemas/address-schema";
import { BudgetItemType, BudgetStatus } from "@/schemas/budgets/budget-schema";
import { CustomerType } from "@/schemas/customers/customer-schema";
import { FollowUpStatus } from "@/schemas/follow-ups/follow-up-schema";
import { ProjectStatus } from "@/schemas/projects/project-schema";
import { TaskPriority, TaskStatus } from "@/schemas/tasks/task-schema";
import { UserRole } from "@/schemas/users/user-schema";
import { hasher } from "@/security/password-hasher";

const seed = async () => {
	await db.user.create({
		data: {
			name: "João Silva",
			email: "jops2205@gmail.com",
			verified: true,
			password: await hasher.hash("secret"),
			role: UserRole.MANAGER,
		},
	});

	const users = [];

	for (let i = 0; i < 50; i++) {
		const hashedPassword = await hasher.hash(faker.internet.password());

		const user = await db.user.create({
			data: {
				name: faker.person.firstName(),
				email: faker.internet.email(),
				verified: faker.datatype.boolean(),
				password: hashedPassword,
				role: faker.helpers.enumValue(UserRole),
			},
		});

		users.push(user);
	}

	const customerAddresses = [];

	for (let i = 0; i < 30; i++) {
		const address = await db.address.create({
			data: {
				street: faker.location.streetAddress(),
				postalCode: faker.helpers.replaceSymbols("####-###"),
				complement: faker.location.secondaryAddress(),
				district: faker.helpers.enumValue(District),
			},
		});

		customerAddresses.push(address);
	}

	const customers = [];

	for (const address of customerAddresses) {
		const customer = await db.customer.create({
			data: {
				name: faker.person.firstName(),
				email: faker.internet.email(),
				taxpayer: faker.helpers.replaceSymbols("### ### ###"),
				phone: faker.helpers.replaceSymbols("### ### ###"),
				type: faker.helpers.enumValue(CustomerType),
				addressId: address.id,
			},
		});

		customers.push(customer);
	}

	const projectAddresses = [];

	for (let i = 0; i < 50; i++) {
		const address = await db.address.create({
			data: {
				street: faker.location.streetAddress(),
				postalCode: faker.helpers.replaceSymbols("####-###"),
				complement: faker.location.secondaryAddress(),
				district: faker.helpers.enumValue(District),
			},
		});

		projectAddresses.push(address);
	}

	const projects = [];

	for (let i = 0; i < customers.length; i++) {
		const code = faker.number
			.int({ min: 1, max: 9999 })
			.toString()
			.padStart(3, "0");

		const project = await db.project.create({
			data: {
				name: faker.lorem.sentence(),
				code: `${code}/${new Date().getFullYear()}`,
				status: faker.helpers.enumValue(ProjectStatus),
				customerId: customers[i].id,
				addressId: projectAddresses[i].id,
			},
		});

		projects.push(project);
	}

	for (let i = 0; i < 10; i++) {
		const creator = faker.helpers.arrayElement(users);
		const executor = faker.helpers.arrayElement(users);

		await db.task.create({
			data: {
				title: faker.lorem.sentence(),
				description: faker.lorem.paragraph(),
				priority: faker.helpers.enumValue(TaskPriority),
				status: faker.helpers.enumValue(TaskStatus),
				scheduledAt: faker.date.soon(),
				startedAt: faker.date.soon(),
				completedAt: faker.date.soon(),
				creatorId: creator.id,
				executorId: executor.id,
			},
		});
	}

	const budgets = [];

	for (const project of projects) {
		const user = faker.helpers.arrayElement(users);

		const budget = await db.budget.create({
			data: {
				name: faker.lorem.sentence(),
				status: faker.helpers.enumValue(BudgetStatus),
				percentageDiscount: faker.number.int({ min: 0, max: 15 }),
				attachmentsUrl: faker.internet.url(),
				userId: user.id,
				projectId: project.id,
			},
		});

		budgets.push(budget);
	}

	for (const budget of budgets) {
		for (let i = 0; i < 5; i++) {
			await db.budgetItem.create({
				data: {
					name: faker.commerce.productName(),
					price: faker.number.int({ min: 5000, max: 40000 }),
					quantity: faker.number.int({ min: 2, max: 48 }),
					type: faker.helpers.enumValue(BudgetItemType),
					budgetId: budget.id,
				},
			});
		}
	}

	for (const budget of budgets) {
		const user = faker.helpers.arrayElement(users);

		await db.followUp.create({
			data: {
				description: faker.lorem.sentence(),
				status: faker.helpers.enumValue(FollowUpStatus),
				scheduledAt: faker.date.soon(),
				userId: user.id,
				budgetId: budget.id,
			},
		});
	}
};

seed()
	.then(async () => {
		await db.$disconnect();
	})
	.catch(async (error) => {
		await db.$disconnect();

		console.error(error);
		process.exit(1);
	});
