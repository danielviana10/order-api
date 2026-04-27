import * as bcrypt from "bcrypt";
import { UpdateUserDto } from "../dto/update-user.dto";
import { Prisma } from "@prisma/client";

export async function buildUserUpdateData(data: UpdateUserDto) {
    const updateData: Prisma.UserUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;

    if (data.password !== undefined) {
        updateData.password = await bcrypt.hash(data.password, 10);
    }

    return updateData;
}
