import { getUnreadAlertCount, hasUnreadAlerts } from '../src/utils/alertUtils';

test('counts only unread alerts', () => {
  const alerts = [
    { _id: '1', read: true },
    { _id: '2', read: false },
    { _id: '3', read: false },
    { _id: '4' },
  ];

  expect(getUnreadAlertCount(alerts)).toBe(3);
  expect(hasUnreadAlerts(alerts)).toBe(true);
});

test('returns zero when all alerts are read', () => {
  const alerts = [
    { _id: '1', read: true },
    { _id: '2', read: true },
  ];

  expect(getUnreadAlertCount(alerts)).toBe(0);
  expect(hasUnreadAlerts(alerts)).toBe(false);
});
