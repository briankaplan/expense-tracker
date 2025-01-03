const CHECKLIST = {
  reports: {
    setup: [
      '✓ Basic component structure',
      '✓ Type definitions',
      '✓ Context setup',
      '□ Component implementations',
      '□ Feature implementations',
      '□ Testing'
    ],
    components: {
      OpenReport: [
        '□ Basic layout',
        '□ Receipt matching interface',
        '□ Sorting controls',
        '□ Filtering system',
        '□ Export functionality'
      ],
      ReceiptMatcher: [
        '□ Upload interface',
        '□ Batch processing',
        '□ Manual matching',
        '□ Tip adjustment',
        '□ Sync with queue'
      ]
    }
  }
};

export function getChecklistStatus() {
  const total = Object.values(CHECKLIST.reports.setup).length +
    Object.values(CHECKLIST.reports.components.OpenReport).length +
    Object.values(CHECKLIST.reports.components.ReceiptMatcher).length;
  
  const completed = Object.values(CHECKLIST.reports.setup).filter(item => item.startsWith('✓')).length +
    Object.values(CHECKLIST.reports.components.OpenReport).filter(item => item.startsWith('✓')).length +
    Object.values(CHECKLIST.reports.components.ReceiptMatcher).filter(item => item.startsWith('✓')).length;
  
  return {
    total,
    completed,
    percentage: Math.round((completed / total) * 100)
  };
}

export { CHECKLIST }; 