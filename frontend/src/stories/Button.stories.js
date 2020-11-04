import React from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import '../app/css/index.scss';

import { action } from '@storybook/addon-actions';
import Button from '../app/components/Button';

library.add(fab, far, fas);
export default {
  title: 'Button',
  component: Button,
};
export const Save = () => <Button buttonType="save" />;

export const Delete = () => <Button buttonType="delete" />;
export const Download = () => <Button buttonType="download" />;
export const Submit = () => <Button buttonType="submit" />;
export const Back = () => <Button buttonType="back" locationRoute="/" />;
export const Custom = () => <Button buttonType="none" optionalIcon="star" optionalText=" Yay!" optionalClassname="btn btn-warning btn-outline-dark" />;
export const Clickable = () => <Button buttonType="clickable" optionalText="clickable" action={action('button-clicked')} locationRoute="/" />;
