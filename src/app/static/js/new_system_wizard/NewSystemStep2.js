'use strict';

class NewSystemStep2 extends React.Component {
  constructor(props) {
    super(props);
    // Bindings for form fields would go here,
    // and state would keep track of field input
  }

  render() {
    if (this.props.currentStep !== 2) {
      return null;
    }

    return (
      <div>
        <label>STEP 2</label>
        <input></input>
          // Form fields would go here
        <br />
      </div>
    );
  }
}