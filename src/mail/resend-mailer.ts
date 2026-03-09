import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { compile } from "handlebars";
import mjml from "mjml";
import { Resend } from "resend";
import { env } from "../env";

type Context = Record<string, string>;

type Template = "user-authentication" | "user-creation" | "user-verification";

type SendOptions = {
	to: string;
	subject: string;
	name: Template;
	context?: Context;
};

class ResendMailer {
	private readonly resend: Resend;

	constructor(key: string) {
		this.resend = new Resend(key);
	}

	async send(opts: SendOptions) {
		const { to, subject, name, context = {} } = opts;

		const html = this.render(name, context);

		let attempts = 0;

		while (attempts < 3) {
			const { error } = await this.resend.emails.send({
				from: "Magnivertical <no-reply@magnivertical.com>",
				to,
				subject: `${subject} | ${Date.now()}`,
				html,
			});

			if (!error) {
				break;
			}

			attempts += 1;
		}
	}

	private render(name: string, context: Context) {
		const path = resolve(__dirname, "mjml", `${name}.mjml`);
		const file = readFileSync(path, "utf-8");

		return mjml(compile(file)(context)).html;
	}
}

export const mailer = new ResendMailer(env.get("RESEND_API_KEY"));
