'use strict';

class NewSystemStep3 extends React.Component {
  constructor(props) {
    super(props);
    // Bindings for form fields would go here,
    // and state would keep track of field input
  }

  render() {
    if (this.props.currentStep !== 3) {
      return null;
    }

    return (
      <div>
        <label>STEP 3</label>
        <input></input>
          // Form fields would go here
        <br />
      </div>
    );
  }
}