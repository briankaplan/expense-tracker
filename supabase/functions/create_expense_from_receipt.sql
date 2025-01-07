CREATE OR REPLACE FUNCTION create_expense_from_receipt(
  p_receipt_id UUID,
  p_transaction_id UUID,
  p_user_id UUID,
  p_amount DECIMAL,
  p_date DATE,
  p_merchant TEXT,
  p_category TEXT,
  p_notes TEXT,
  p_status TEXT
) RETURNS void AS $$
BEGIN
  -- Create the expense
  INSERT INTO expenses (
    user_id,
    amount,
    date,
    merchant,
    category,
    notes,
    status,
    receipt_id,
    transaction_id,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_amount,
    p_date,
    p_merchant,
    p_category,
    p_notes,
    p_status,
    p_receipt_id,
    p_transaction_id,
    NOW(),
    NOW()
  );

  -- Update the receipt status
  UPDATE receipts
  SET 
    status = 'completed',
    matched_transaction_id = p_transaction_id,
    updated_at = NOW()
  WHERE id = p_receipt_id;

  -- If there's a transaction, update its status
  IF p_transaction_id IS NOT NULL THEN
    UPDATE bank_transactions
    SET 
      matched_receipt_id = p_receipt_id,
      status = 'matched',
      updated_at = NOW()
    WHERE id = p_transaction_id;
  END IF;
END;
$$ LANGUAGE plpgsql; 