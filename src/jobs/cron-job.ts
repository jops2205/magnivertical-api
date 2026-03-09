import { randomUUID } from "node:crypto";
import { CronJob as Cron } from "cron";
import type { CronTime } from "@/utils/enums/cron-time";

type CronDef = {
	cronTime: CronTime;
	onTick: () => void | Promise<void>;
};

type ScheduleOptions = CronDef & {
	name?: string;
};

class CronJob {
	private readonly jobs: Record<string, CronDef> = {};

	schedule(opts: ScheduleOptions): void {
		const { cronTime, onTick, name } = opts;

		const key = name ?? randomUUID();

		this.jobs[key] = {
			cronTime,
			onTick,
		};
	}

	mount(): void {
		const keys = Object.keys(this.jobs);

		for (const key of keys) {
			const { cronTime, onTick } = this.jobs[key];

			const job = new Cron(cronTime, onTick);

			job.start();
		}
	}
}

export const cron = new CronJob();
