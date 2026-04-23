import { API_URL } from './config';

export async function validatePromotion(code: string, originalPrice: number, token: string) {
    const response = await fetch(`${API_URL}/promotions/validate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code, originalPrice }),
    });
    return response.json();
}

export async function getPromotions(token: string) {
    const response = await fetch(`${API_URL}/promotions`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
}

export async function createPromotion(data: {
    code: string;
    name: string;
    discountType: 'flat' | 'percentage';
    discountValue: number;
    expiresAt: string;
    usageLimit?: number;
}, token: string) {
    const response = await fetch(`${API_URL}/promotions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return response.json();
}

export async function deletePromotion(id: string, token: string) {
    const response = await fetch(`${API_URL}/promotions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
}

export async function uploadSlip(id: string, file: File, token: string) {
    const formData = new FormData();
    formData.append('slip', file);

    const response = await fetch(`${API_URL}/reservations/${id}/slip`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    return response.json();
}

export async function verifySlip(id: string, action: 'approve' | 'reject', token: string) {
    const response = await fetch(`${API_URL}/reservations/${id}/verify`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
    });
    return response.json();
}
