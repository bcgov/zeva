import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from '../app/components/Modal';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import '../app/css/index.scss';
// import { storiesOf } from "@storybook/react";
// import { action } from "@storybook/addon-actions";
import { storiesOf } from '@storybook/react';

library.add(fab, far, fas);
const handleCancel = () => console.log('CANCEL!');
const handleSubmit = () => console.log('SUBMIT!');

storiesOf('modal', module)
  .add('basic modal', () => (
    <Modal
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      showModal
    />
  ))
  .add('no modal', () => (
    <Modal
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      showModal={false}
    />
  ))
  .add('modal with title', () => (
    <Modal
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      showModal
      title="our awesome modal!"
      icon={<FontAwesomeIcon icon="paper-plane" />}
    />
  ));


