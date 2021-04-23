import React, { useState } from 'react';
import { Button, Input, Modal, Form, Upload, Icon, message, Spin } from 'antd';
import { Global } from '../api/';
import { FormComponentProps } from 'antd/lib/form';
import { isNull } from 'lodash';
import { getFeedbackFormData } from 'helpers';
import { useIntl } from 'react-intl';


interface FeedbackModalProps extends FormComponentProps {
  hide: () => void;
  show: boolean;
}

/**
 * @param {function} hide
 * @param {boolean} show
 * @param {object} form
 * @return {React.ReactNode}
 */
export const FeedbackModalTemplate = ({ hide, show, form }: FeedbackModalProps) => {
  const intl = useIntl();
  const [files, setFiles] = useState<any[]>([]);
  const [hasLoading, setLoading] = useState<boolean>(false);
  const { getFieldDecorator, validateFields, resetFields } = form;

  /**
   * @description отправка
   * @param params
   */
  const sendFeedBack = async (params): Promise<any> => {
    setLoading(true);
    await Global.sendFeedBack(params)
      .then(() => {
        message.success('Thanks :)', 2);
        resetFields();
        setFiles([]);
        hide();
      })
      .finally(() => setLoading(false));
  };

  const handleSend = (): void => {
    validateFields((errors, values) => {
      if (isNull(errors)) {
        sendFeedBack(getFeedbackFormData(values));
      }
    });
  };

  const handleUpload = () => {
    return false;
  };

  const uploadProps = {
    name: 'files',
    multiple: true,
    beforeUpload: handleUpload,
    onChange: ({ fileList }) => setFiles(fileList),
    fileList: files
  };

  return (
    <Modal
      title={intl.formatMessage({ id: 'feedback' })}
      footer={[
        <Button key="back" onClick={hide}>
          {intl.formatMessage({ id: 'cancel' })}
        </Button>,
        <Button key="submit" type="primary" htmlType="submit" onClick={handleSend}>
          {intl.formatMessage({ id: 'send' })}
        </Button>
      ]}
      visible={show}
      onCancel={hide}
    >
      <Spin spinning={hasLoading} tip="Sending...">
        <Form>
          <Form.Item label={intl.formatMessage({ id: 'subject' })}>
            {getFieldDecorator('subject', {
              rules: [{ required: false }]
            })(<Input />)}
          </Form.Item>

          <Form.Item label={intl.formatMessage({ id: 'message' })}>
            {getFieldDecorator('message', {
              rules: [{ required: true }]
            })(<Input.TextArea style={{ height: '200px' }} />)}
          </Form.Item>

          <Form.Item label={intl.formatMessage({ id: 'attachments' })}>
            {getFieldDecorator('attachments', {
              rules: [{ required: false }]
            })(
              <Upload {...uploadProps}>
                <Button>
                  <Icon type="upload" /> {intl.formatMessage({ id: 'click-to-upload' })}
                </Button>
              </Upload>
            )}
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export const FeedbackModal = Form.create<FeedbackModalProps>()(FeedbackModalTemplate);

export default { FeedbackModal };
