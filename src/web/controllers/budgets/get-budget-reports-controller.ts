import { resolve } from "node:path";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import PDFDocument from "pdfkit";
import { z } from "zod";
import { db } from "@/database";
import { District } from "@/schemas/address-schema";
import { idParamSchema } from "@/schemas/id-param-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";
import { getDistrict } from "@/utils/consts/formatted-districts";
import { calculateNetValue } from "@/utils/funcs/calculate-net-value";
import { formatCurrency } from "@/utils/funcs/format-currency";

export const getBudgetReportsController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.get(
		"/reports/:id",
		{
			preHandler: [
				app.authenticate,
				app.roles(UserRole.MANAGER, UserRole.ASSISTANT),
				app.verified,
			],
			schema: {
				summary: "Get Budget Reports",
				operationId: "getBudgetReports",
				tags: ["budgets"],
				params: idParamSchema,
				response: {
					200: z.unknown(),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: budgetId } = request.params;

			const budget = await db.budget.findUnique({
				where: { id: budgetId },
				include: {
					items: true,
					user: {
						select: { name: true },
					},
					project: {
						include: {
							address: true,
							customer: true,
						},
					},
				},
			});

			if (!budget) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			response
				.type("application/pdf")
				.header("content-disposition", `attachment; filename="orçamento.pdf"`);

			const document = new PDFDocument({ size: "A4" });

			const SECTION_GAP = 1.5;
			const PARAGRAPH_GAP = 2;

			const orDefault = (value?: string) => value ?? "—";
			const imagePath = resolve(__dirname, "../../../assets/logo.png");

			const address = budget.project.address;
			const complement = address.complement ? `${address.complement},` : "";

			document
				.image(imagePath, { width: 110 })
				.moveDown(SECTION_GAP)
				.fontSize(16)
				.text("Proposta de Orçamento");

			document
				.fontSize(10)
				.text(`${budget.createdAt.toLocaleDateString("pt-PT")}`);

			document
				.moveDown(SECTION_GAP)
				.text(`Obra: ${budget.project.name}`, { paragraphGap: PARAGRAPH_GAP })
				.text(`Orçamentista: ${orDefault(budget.user?.name)}`, {
					paragraphGap: PARAGRAPH_GAP,
				})
				.text(`Cliente: ${orDefault(budget.project.customer?.name)}`, {
					paragraphGap: PARAGRAPH_GAP,
				})
				.text(`E-mail: ${orDefault(budget.project.customer?.email)}`, {
					paragraphGap: PARAGRAPH_GAP,
				})
				.text(`Telefone: ${orDefault(budget.project.customer?.phone)}`, {
					paragraphGap: PARAGRAPH_GAP,
				})
				.text(
					`Morada: ${address.street}, ${complement} ${address.postalCode}, ${getDistrict(District[address.district])}`,
					{ paragraphGap: PARAGRAPH_GAP },
				);

			const table = document.moveDown(SECTION_GAP).table();

			const tableHead = [
				"Artigo",
				"Descrição",
				"Quantidade",
				"Preço Unitário",
				"Total",
			];

			table.row(
				tableHead.map((text) => ({
					text,
					backgroundColor: "#CCCCCC",
					align: "center",
				})),
			);

			for (const [index, item] of budget.items.entries()) {
				const number = (index + 1).toString().concat(".");
				const itemTotalValue = item.price * item.quantity;

				const itemNetValue = calculateNetValue(
					item.price,
					budget.percentageDiscount,
				);

				const totalNetValue = calculateNetValue(
					itemTotalValue,
					budget.percentageDiscount,
				);

				table.row([
					{ text: number, align: "center" },
					item.name,
					{ text: item.quantity.toString(), align: "center" },
					{ text: formatCurrency(itemNetValue), align: "center" },
					{ text: formatCurrency(totalNetValue), align: "center" },
				]);
			}

			const budgetTotalValue = budget.items.reduce(
				(total, item) => total + item.price * item.quantity,
				0,
			);

			const budgetNetValue = calculateNetValue(
				budgetTotalValue,
				budget.percentageDiscount,
			);

			const valueWithVat = Math.round((budgetNetValue * 123) / 100);

			table
				.row([
					{ text: "Total da Proposta", colSpan: 4, backgroundColor: "#D9D9D9" },
					{
						text: formatCurrency(budgetNetValue),
						backgroundColor: "#D9D9D9",
						align: "center",
					},
				])
				.row([
					{
						text: "Total da Proposta com IVA de 23%",
						colSpan: 4,
						backgroundColor: "#D9D9D9",
					},
					{
						text: formatCurrency(valueWithVat),
						backgroundColor: "#D9D9D9",
						align: "center",
					},
				])
				.end();

			document
				.moveDown(SECTION_GAP)
				.list(
					[
						"Condições de pagamento a acordar;",
						"Não inclui meios de elevação;",
						"Devido à instabilidade do mercado, não é possível definir um prazo de validade. Serão aplicadas atualizações diárias conforme a variação dos preços do vidro e do alumínio;",
						"Este orçamento poderá sofrer alterações caso existam acessórios ou dimensões não especificados no pedido de cotação;",
						"Não estão incluídos quaisquer remates ou acessórios que não estejam especificados no orçamento;",
						"Em caso de adjudicação, o número deste orçamento deve ser mencionado na nota de encomenda; caso contrário, será faturado de acordo com os valores de tabela.",
					],
					{ paragraphGap: PARAGRAPH_GAP },
				);

			document.end();

			return response.send(document);
		},
	);
};
