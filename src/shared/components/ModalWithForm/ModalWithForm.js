import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@ui5/webcomponents-react';
import { Dialog } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { useNotification } from 'shared/contexts/NotificationContext';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';
import { useCustomFormValidator } from 'shared/hooks/useCustomFormValidator';

export const ModalWithForm = ({
  performRefetch,
  sendNotification,
  title,
  button,
  renderForm,
  opened,
  customCloseAction,
  item,
  modalOpeningComponent,
  confirmText,
  invalidPopupMessage,
  className,
  onModalOpenStateChange,
  alwaysOpen,
  getToggleFormFn,
  ...props
}) => {
  const { t } = useTranslation();
  const [isOpen, setOpen] = useState(alwaysOpen || false);
  const [resetFormFn, setResetFormFn] = useState(() => {});

  const {
    isValid,
    formElementRef,
    setCustomValid,
    revalidate,
  } = useCustomFormValidator();
  const notificationManager = useNotification();

  confirmText = confirmText || t('common.buttons.create');

  useEffect(() => {
    if (!alwaysOpen) setOpenStatus(opened); // if alwaysOpen===true we can ignore the 'opened' prop
  }, [opened]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isOpen !== undefined) onModalOpenStateChange(isOpen);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const setOpenStatus = status => {
    if (status) {
      setTimeout(() => revalidate());
    } else {
      if (customCloseAction) customCloseAction();
    }
    setOpen(status);
  };

  useEffect(() => {
    if (getToggleFormFn) {
      // If getToggleFormFn is defined, the function that toggles form modal on/off is passed to parent. The modal will not be closed automatically
      // after clicking on the submit button. You must call toggleFormFn(false) to close the modal at the moment you prefer.
      getToggleFormFn(() => setOpenStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToggleFormFn]);

  function handleFormChanged() {
    setTimeout(() => revalidate());
  }

  function handleFormError(title, message, isWarning) {
    notificationManager.notifyError({
      content: message,
      title: title,
      type: isWarning ? 'warning' : 'error',
    });
  }

  function handleFormSuccess(message) {
    notificationManager.notifySuccess({
      content: message,
    });

    performRefetch();
  }

  function handleFormSubmit() {
    if (isValid) {
      formElementRef.current.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
      if (!getToggleFormFn) {
        setOpenStatus(false);
      }
    }
  }

  function renderConfirmButton() {
    const disabled = !isValid;
    const button = (
      <Button
        design="emphasized"
        disabled={disabled}
        onClick={handleFormSubmit}
        aria-disabled={disabled}
      >
        {confirmText}
      </Button>
    );

    if (invalidPopupMessage && disabled) {
      return (
        <Tooltip
          content={invalidPopupMessage}
          position="top"
          trigger="mouseenter"
          tippyProps={{
            distance: 16,
          }}
        >
          {button}
        </Tooltip>
      );
    }
    return button;
  }

  const renderModalOpeningComponent = _ =>
    modalOpeningComponent ? (
      <div style={{ display: 'contents' }} onClick={() => setOpenStatus(true)}>
        {modalOpeningComponent}
      </div>
    ) : (
      <Button
        design={button.option}
        disabled={!!button.disabled}
        icon={button.glyph || null}
        onClick={() => setOpenStatus(true)}
        aria-label={button.label || null}
      >
        {button.text}
      </Button>
    );

  return (
    <>
      {alwaysOpen ? null : renderModalOpeningComponent()}
      <Dialog
        className={className}
        {...props}
        show={isOpen}
        actions={[
          renderConfirmButton(),
          <Button design="Transparent" onClick={resetFormFn}>
            {t('common.buttons.reset')}
          </Button>,
          <Button
            design="Transparent"
            onClick={() => {
              setOpenStatus(false);
            }}
          >
            {t('common.buttons.cancel')}
          </Button>,
        ]}
        disableAutoClose={true}
        onClose={() => {
          setOpenStatus(false);
        }}
        title={title}
      >
        {isOpen &&
          renderForm({
            handleSetResetFormFn: setResetFormFn,
            formElementRef,
            isValid,
            setCustomValid,
            onChange: handleFormChanged,
            onError: handleFormError,
            onCompleted: handleFormSuccess,
            performManualSubmit: handleFormSubmit,
            item: item,
          })}
      </Dialog>
    </>
  );
};

ModalWithForm.propTypes = {
  performRefetch: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  renderForm: PropTypes.func.isRequired,
  opened: PropTypes.bool,
  customCloseAction: PropTypes.func,
  item: PropTypes.object,
  modalOpeningComponent: PropTypes.node,
  confirmText: PropTypes.string,
  invalidPopupMessage: PropTypes.string,
  button: CustomPropTypes.button,
  className: PropTypes.string,
  onModalOpenStateChange: PropTypes.func,
  alwaysOpen: PropTypes.bool, // set this to true if you want to control the modal by rendering and un-rendering it instead of the open/closed state
};

ModalWithForm.defaultProps = {
  performRefetch: () => {},
  invalidPopupMessage: '',
  onModalOpenStateChange: () => {},
  alwaysOpen: false,
};
