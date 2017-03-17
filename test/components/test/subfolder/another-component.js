import React, { PropTypes } from "react";

const AnotherComponent = ({ b }) => <div>{b}</div>;

AnotherComponent.propTypes = {
  /**
   * Just an "b"
   */
  b: PropTypes.String,
};

export default AnotherComponent;
