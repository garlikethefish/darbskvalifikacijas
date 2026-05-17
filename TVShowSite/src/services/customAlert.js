import { reactive } from 'vue';

const queue = [];

export const alertState = reactive({
  visible: false,
  type: 'alert',
  title: '',
  message: '',
  inputValue: '',
  placeholder: '',
  confirmText: '',
  cancelText: '',
  resolve: null
});

const resetState = () => {
  alertState.visible = false;
  alertState.type = 'alert';
  alertState.title = '';
  alertState.message = '';
  alertState.inputValue = '';
  alertState.placeholder = '';
  alertState.confirmText = '';
  alertState.cancelText = '';
  alertState.resolve = null;
};

const showNext = () => {
  if (alertState.visible || queue.length === 0) return;

  const { options, resolve } = queue.shift();
  alertState.type = options.type || 'alert';
  alertState.title = options.title || '';
  alertState.message = String(options.message ?? '');
  alertState.inputValue = options.defaultValue || '';
  alertState.placeholder = options.placeholder || '';
  alertState.confirmText = options.confirmText || '';
  alertState.cancelText = options.cancelText || '';
  alertState.resolve = resolve;
  alertState.visible = true;
};

const openDialog = (options) => new Promise((resolve) => {
  queue.push({ options, resolve });
  showNext();
});

export const customAlert = (message, options = {}) => openDialog({
  ...options,
  type: 'alert',
  message
});

export const customConfirm = (message, options = {}) => openDialog({
  ...options,
  type: 'confirm',
  message
});

export const customPrompt = (message, defaultValue = '', options = {}) => openDialog({
  ...options,
  type: 'prompt',
  message,
  defaultValue
});

export const resolveCustomAlert = (value) => {
  const resolve = alertState.resolve;
  resetState();
  if (resolve) resolve(value);
  setTimeout(showNext, 0);
};
