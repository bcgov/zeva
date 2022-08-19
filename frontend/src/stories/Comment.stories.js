import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import '../app/css/index.scss';

// import{ action } from "@storybook/addon-actions";
import { storiesOf } from '@storybook/react';

import Comment from '../app/components/Comment';

library.add(fab, far, fas);

storiesOf('comment', module).add('comment', () => (
  <Comment
    comment="this vehicle does not meet the ZEV requirements"
    user="Emily"
    updateTimestamp="Dec 1, 2020"
  />
));
