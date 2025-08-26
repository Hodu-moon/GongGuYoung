import { api } from "@/api/api";


export interface BNPLRemain {
    memberId:number;
    remain: number;
}

export interface BNPLItem{
    paymentId:number;
    itemName:string;
    groupPurchaseTitle:string;
    itemImageUrl:string;
    bnplAmount:number;
    bnplstatus: string;
}

export interface PaymentPost{
    groupPurchaseId:number;
    memberId:number;
    count:number;
    immediate:number;
    bnpl:number;
    paymentType:string;
}

export interface RefundPost{
    paymentEventId:number;
    memberId:number;
}


const API_BASE_URL = "/api/v1/payments";

export async function fetchBNPLRemain(memberId:number):Promise<BNPLRemain|null>{
    try {
        console.log("멤버 아이디",memberId);
        const response = await api.get(`${API_BASE_URL}/bnpl`,{
            params:{
                memberId
            }
        }); 
        console.log("남은 BNPL 한도:", response);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch BNPL remain:", error);
        return null;
    }
}

export async function fetchBNPLItems(memberId:number):Promise<BNPLItem[]|null>{
    try {
        const response = await api.get(`${API_BASE_URL}/bnpl/processing`,{
            params:{
                memberId
            }
        });
        console.log("현재 진행 중인 BNPL 아이템:", response);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch BNPL items:", error);
        return null;
    }
}

export async function postPayment(paymentData:PaymentPost):Promise<boolean>{
    try {
        const response = await api.post(`${API_BASE_URL}`, paymentData);

        console.log("공동구매 결제 참여 ", response);
        return response.status === 200;
    } catch (error) {
        console.error("Failed to post payment:", error);
        return false;
    }
}

export async function postRefund(refundData:RefundPost):Promise<boolean>{
    try{
        const response = await api.post(`${API_BASE_URL}/refund`,refundData);
        console.log("환불 요청 ", response);
        return response.status === 200;
    } catch (error) {
        console.error("Failed to post refund:", error);
        return false;
    }
}