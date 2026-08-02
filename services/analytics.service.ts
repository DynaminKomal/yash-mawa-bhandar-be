import Order from "../models/order.model";
import Users from "../models/users.model";
import Product from "../models/products.model";
import { orderStatusEnum, paymentStatusEnum } from "../types/order.enum";

export const getDashboardAnalyticsService = async () => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // 1. Basic Counts & Totals
    const [
        totalCustomers,
        totalOrders,
        totalProducts,
        pendingOrders,
        revenueData,
    ] = await Promise.all([
        Users.countDocuments({ role: "customer" }),
        Order.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments({ orderStatus: orderStatusEnum.PENDING }),
        Order.aggregate([
            {
                $match: {
                    paymentStatus: paymentStatusEnum.PAID,
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$finalAmount" },
                },
            },
        ]),
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // 2. Growth metrics (Current Month vs Previous Month)
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
        currentMonthOrders,
        prevMonthOrders,
        currentMonthCustomers,
        prevMonthCustomers,
        currentMonthRevenueData,
    ] = await Promise.all([
        Order.countDocuments({ createdAt: { $gte: startOfCurrentMonth } }),
        Order.countDocuments({ createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } }),
        Users.countDocuments({ role: "customer", createdAt: { $gte: startOfCurrentMonth } }),
        Users.countDocuments({ role: "customer", createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } }),
        Order.aggregate([
            {
                $match: {
                    paymentStatus: paymentStatusEnum.PAID,
                    createdAt: { $gte: startOfCurrentMonth },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$finalAmount" },
                },
            },
        ]),
    ]);

    const currentMonthRevenue = currentMonthRevenueData[0]?.total || 0;

    // Percentage Growth Calculations
    const customerGrowth = prevMonthCustomers > 0
        ? Number((((currentMonthCustomers - prevMonthCustomers) / prevMonthCustomers) * 100).toFixed(2))
        : currentMonthCustomers > 0 ? 100 : 0;

    const orderGrowth = prevMonthOrders > 0
        ? Number((((currentMonthOrders - prevMonthOrders) / prevMonthOrders) * 100).toFixed(2))
        : currentMonthOrders > 0 ? 100 : 0;

    // 3. 12-Month Sales & Orders Aggregation
    const monthlyAggregation = await Order.aggregate([
        {
            $match: {
                orderStatus: { $ne: orderStatusEnum.CANCELLED },
            },
        },
        {
            $group: {
                _id: { $month: "$createdAt" }, // 1 to 12
                totalSales: {
                    $sum: { $ifNull: ["$finalAmount", 0] },
                },
                totalOrdersCount: { $sum: 1 },
            },
        },
    ]);

    // Format monthly data array (12 months: Jan -> 0 to Dec -> 11)
    const monthlySalesArray = Array(12).fill(0);
    const monthlyOrdersArray = Array(12).fill(0);

    monthlyAggregation.forEach((item) => {
        const monthIndex = item._id - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
            monthlySalesArray[monthIndex] = item.totalSales || 0;
            monthlyOrdersArray[monthIndex] = item.totalOrdersCount || 0;
        }
    });

    // 4. Monthly Target Calculation (Default target: ₹1,00,000 / month)
    const monthlyTargetGoal = 100000;
    const targetProgressPercentage = Number(
        Math.min(100, (currentMonthRevenue / monthlyTargetGoal) * 100).toFixed(2)
    );

    return {
        metrics: {
            totalCustomers,
            totalOrders,
            totalProducts,
            totalRevenue,
            pendingOrders,
            customerGrowth,
            orderGrowth,
        },
        monthlySales: monthlySalesArray,
        monthlyOrders: monthlyOrdersArray,
        monthlyTarget: {
            goal: monthlyTargetGoal,
            achieved: currentMonthRevenue,
            progressPercentage: targetProgressPercentage,
        },
    };
};
