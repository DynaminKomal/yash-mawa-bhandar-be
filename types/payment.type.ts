export interface GetOrdersParams {
    page?: number;
    limit?: number;
    search?: string;
    orderStatus?: string;
    paymentStatus?: string;
    paymentMethod?: string;
}

