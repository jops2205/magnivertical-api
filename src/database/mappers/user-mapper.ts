import {
	UserRole,
	type UserWithoutPassword,
} from "@/schemas/users/user-schema";
import type { User as RawUser } from "../generated/client";

export const userMapper = (user: RawUser): UserWithoutPassword => {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		verified: user.verified,
		role: UserRole[user.role],
		createdAt: user.createdAt,
	};
};
