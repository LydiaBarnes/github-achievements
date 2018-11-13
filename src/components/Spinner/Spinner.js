import React from 'react';

import spinner from '../../img/spinner.gif';

const Spinner = (props) => {
  return (
    <img src={spinner} alt={props.alt} width="25" />
  );
};

export default Spinner;
