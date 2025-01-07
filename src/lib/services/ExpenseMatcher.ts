export class ExpenseMatcher {
  static async findMatches(expense: any, receipts: any[]) {
    if (!receipts.length) return [];

    // Sort receipts by date proximity and amount similarity
    const matches = receipts
      .map(receipt => {
        const dateScore = getDateMatchScore(new Date(expense.date), new Date(receipt.date));
        const amountScore = getAmountMatchScore(expense.amount, receipt.amount);
        const totalScore = (dateScore + amountScore) / 2;

        return {
          ...receipt,
          matchScore: totalScore
        };
      })
      .filter(match => match.matchScore > 0.7) // Only return good matches
      .sort((a, b) => b.matchScore - a.matchScore);

    return matches;
  }
}

function getDateMatchScore(expenseDate: Date, receiptDate: Date) {
  const diffInDays = Math.abs(expenseDate.getTime() - receiptDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (diffInDays === 0) return 1;
  if (diffInDays <= 1) return 0.9;
  if (diffInDays <= 2) return 0.8;
  if (diffInDays <= 3) return 0.7;
  if (diffInDays <= 7) return 0.5;
  return 0;
}

function getAmountMatchScore(expenseAmount: number, receiptAmount: number) {
  const diff = Math.abs(expenseAmount - receiptAmount);
  const percentDiff = diff / expenseAmount;

  if (percentDiff === 0) return 1;
  if (percentDiff <= 0.01) return 0.9; // 1% difference
  if (percentDiff <= 0.05) return 0.8; // 5% difference
  if (percentDiff <= 0.1) return 0.7;  // 10% difference
  if (percentDiff <= 0.2) return 0.5;  // 20% difference
  return 0;
} 