export function notFound(req, res) {
  res.status(404).json({message: 'Route not found.'});
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === 11000) {
    let field = null;
    let value = null;

    if (err.keyValue && typeof err.keyValue === 'object') {
      field = Object.keys(err.keyValue)[0];
      value = err.keyValue[field];
    } else if (err.keyPattern && typeof err.keyPattern === 'object') {
      field = Object.keys(err.keyPattern)[0];
    } else if (err.message && typeof err.message === 'string') {
      const match = err.message.match(/index:\s*([^\s_]+)/);
      if (match) field = match[1];
    }

    let message = 'A unique value already exists.';
    if (field === 'vehicleNumber') {
      message = value
        ? `Vehicle number "${value}" is already registered.`
        : 'A vehicle with this registration number already exists.';
    } else if (field === 'chassisNumber') {
      message = value
        ? `Chassis number "${value}" is already registered.`
        : 'A vehicle with this chassis number already exists.';
    } else if (field === 'engineNumber') {
      message = value
        ? `Engine number "${value}" is already registered.`
        : 'A vehicle with this engine number already exists.';
    } else if (field === 'email') {
      message = value
        ? `Email "${value}" is already in use.`
        : 'An account with this email already exists.';
    } else if (field) {
      const label = field.replace(/([A-Z])/g, ' $1').toLowerCase();
      message = value
        ? `${label.charAt(0).toUpperCase() + label.slice(1)} "${value}" already exists.`
        : `A record with this ${label} already exists.`;
    }

    return res.status(409).json({ message, field });
  }
  res.status(err.status || 500).json({ message: err.message || 'Server error.' });
}

