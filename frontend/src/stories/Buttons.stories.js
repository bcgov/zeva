import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import '../app/css/index.scss';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Button from '../app/components/Button';

library.add(fab, far, fas);
storiesOf('button', module)
  .add('save', () => (
    <Button buttonType="save" />
  ))
  .add('delete', () => (
    <Button buttonType="delete" />
  ))
  .add('download', () => (
    <Button buttonType="download" />
  ))
  .add('submit', () => (
    <Button buttonType="submit" />
  ))
  .add('back', () => (
    <Button buttonType="back" locationRoute="/" />
  ))
  .add('custom text', () => (
    <Button buttonType="none" optionalIcon="star" optionalText=" Yay!" optionalClassname="btn btn-warning btn-outline-dark" />
  ))
  .add('clickable', () => (
    <Button buttonType="clickable" optionalText="clickable" action={action('button-clicked')} locationRoute="/" />
  ));
