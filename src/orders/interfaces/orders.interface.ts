interface ProcessOrderJobData {
    orderId: string;
}

interface RequestWithUser extends Request {
    user: {
        userId: string;
        email: string;
    };
}

export type { ProcessOrderJobData, RequestWithUser };
