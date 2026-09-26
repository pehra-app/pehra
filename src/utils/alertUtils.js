export function getUnreadAlertCount(alerts = []) {
  return alerts.filter(alert => !alert?.read).length;
}

export function hasUnreadAlerts(alerts = []) {
  return getUnreadAlertCount(alerts) > 0;
}
