export class ExpenseTransactionMatcher {
  static async findMatch(expense: any, transactions: any[]) {
    if (!transactions.length) return null;

    // Sort transactions by date proximity, amount similarity, and merchant name similarity
    const matches = transactions
      .map(transaction => {
        const dateScore = getDateMatchScore(new Date(expense.date), new Date(transaction.date));
        const amountScore = getAmountMatchScore(expense.amount, Math.abs(transaction.amount));
        const merchantScore = getMerchantMatchScore(expense.merchant, transaction.merchant_name);
        const totalScore = (dateScore + amountScore + (merchantScore * 2)) / 4; // Merchant match is weighted more

        return {
          ...transaction,
          matchScore: totalScore
        };
      })
      .filter(match => match.matchScore > 0.8) // Only return very good matches for transactions
      .sort((a, b) => b.matchScore - a.matchScore);

    return matches[0] || null; // Return the best match or null
  }
}

function getDateMatchScore(expenseDate: Date, transactionDate: Date) {
  const diffInDays = Math.abs(expenseDate.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (diffInDays === 0) return 1;
  if (diffInDays <= 1) return 0.9;
  if (diffInDays <= 2) return 0.7;
  if (diffInDays <= 3) return 0.5;
  return 0;
}

function getAmountMatchScore(expenseAmount: number, transactionAmount: number) {
  const diff = Math.abs(expenseAmount - transactionAmount);
  const percentDiff = diff / expenseAmount;

  if (percentDiff === 0) return 1;
  if (percentDiff <= 0.01) return 0.9; // 1% difference
  if (percentDiff <= 0.05) return 0.7; // 5% difference
  if (percentDiff <= 0.1) return 0.5;  // 10% difference
  return 0;
}

function getMerchantMatchScore(expenseMerchant?: string, transactionMerchant?: string) {
  if (!expenseMerchant || !transactionMerchant) return 0;

  const exp = expenseMerchant.toLowerCase().trim();
  const trans = transactionMerchant.toLowerCase().trim();

  if (exp === trans) return 1;
  if (exp.includes(trans) || trans.includes(exp)) return 0.9;
  if (getLevenshteinDistance(exp, trans) <= 2) return 0.8;
  return 0;
}

function getLevenshteinDistance(str1: string, str2: string) {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null)
  );

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }

  return track[str2.length][str1.length];
} 