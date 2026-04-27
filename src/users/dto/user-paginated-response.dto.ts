import { PaginatedResponseDto } from "../../dto/paginated-response.dto";
import { UserResponseDto } from "./user-response.dto";

export class UserPaginatedResponseDto extends PaginatedResponseDto<UserResponseDto> {
    constructor(
        data: UserResponseDto[],
        total: number,
        page: number,
        limit: number,
    ) {
        super(data, total, page, limit);
    }
}
