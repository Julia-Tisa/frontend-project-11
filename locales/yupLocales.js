import * as yup from 'yup';

export default (i18nInstance) => {
  yup.setLocale({
    mixed: {
      notOneOf: i18nInstance.t('notOneOf'),
    },
    string: {
      url: i18nInstance.t('notValid'),
    },
  });
};
