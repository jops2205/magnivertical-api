import type { Prisma } from "@/database/generated/client";
import { type Project, ProjectStatus } from "@/schemas/projects/project-schema";
import { addressMapper } from "./address-mapper";

type RawProject = Prisma.ProjectGetPayload<{
	include: {
		address: true;
	};
}>;

export const projectMapper = (project: RawProject): Project => {
	const { address } = project;

	return {
		id: project.id,
		name: project.name,
		code: project.code,
		status: ProjectStatus[project.status],
		startedAt: project.startedAt,
		endedAt: project.endedAt,
		customerId: project.customerId,
		address: addressMapper(address),
	};
};
