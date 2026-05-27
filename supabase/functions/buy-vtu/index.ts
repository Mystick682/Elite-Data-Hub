async function confirmPurchase() {
    let pin = ""; pinInputs.forEach(i => pin += i.value);
    if (pin.length < 4) return showToast("Enter 4-digit PIN", "error");
    const phone = document.getElementById('phoneInput').value;
    const btn = document.getElementById('confirmPinBtn');
    btn.innerText = "Processing..."; btn.disabled = true;

    try {
        // 1. VERIFY BALANCE (NO DEDUCTION)
        const { data: vRes } = await _supabase.rpc('verify_before_purchase', { uid: userId, amt: parseFloat(amount), input_pin: pin });
        if (vRes !== 'verified') {
            btn.disabled = false; btn.innerText = "Confirm Payment";
            return showToast(vRes.replace('_', ' '), "error");
        }

        // 2. ATTEMPT VTU DELIVERY
        showToast("Verified. Delivering...", "success");
        const { data: vtu, error: fErr } = await _supabase.functions.invoke('buy-vtu', {
            body: { actionType: 'airtime', networkId: selectedNetworkId, phoneNumber: phone, planId: selectedRechargeId, amount: amount }
        });

        // 3. CHECK RESPONSE (IF 400 ERROR, fErr WILL EXIST)
        if (fErr || !vtu || vtu.error) {
            btn.disabled = false; btn.innerText = "Confirm Payment";
            return showToast("Provider Error: Low Stock. Your wallet was NOT charged.", "error");
        }

        // 4. ONLY IF WE ARE HERE (SUCCESS), TAKE THE MONEY
        await _supabase.rpc('execute_deduction', { uid: userId, amt: parseFloat(amount), p_type: 'Airtime', p_desc: `${networkName} ₦${amount} to ${phone}` });
        
        showToast("✅ Airtime Sent Successfully!", "success");
        setTimeout(() => window.location.href = "dashboard.html", 2000);

    } catch (err) { 
        showToast("System Busy", "error"); 
        btn.disabled = false; 
    }
}
