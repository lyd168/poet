import * as React from 'react';
import * as classNames from 'classnames';

import * as Common from '../../../common';
import { OptionGroup, Option } from '../../../components/molecules/OptionGroup';

import './Pricing.scss';

export interface PricingProps {
  readonly pricing: Common.Pricing;
  readonly onChange: (pricing: Common.Pricing) => void;
  readonly displayErrors?: boolean;
}

interface PricingState {
  readonly amountInputHasBeenBlurred: boolean;
}

export class Pricing extends React.Component<PricingProps, PricingState> {
  private valueInput: HTMLInputElement;

  constructor() {
    super(...arguments);
    this.state = {
      amountInputHasBeenBlurred: false
    }
  }

  render() {
    return (
      <section className="pricing">
        <h2>Pricing</h2>
        <div className="row">
          <div className="col-sm-4 label"><label>Frequency</label></div>
          <div className="col-sm-8">
            <OptionGroup
              className="panel-option-group"
              selectedId={this.props.pricing.frequency}
              onOptionSelected={this.onFrequencyChange}
            >
              <Option id="oneTime">One Time</Option>
              <Option id="per-page-view">Per Page View</Option>
            </OptionGroup>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4 label"><label>Price</label></div>
          <div className="col-sm-8">
            <div className="input-group">
              <input
                onChange={this.onAmountChange}
                type="number"
                className={classNames('form-control', this.isValueInvalid() && 'invalid')}
                onBlur={this.onBlur}
                ref={valueInput => this.valueInput = valueInput}
                min="0"/>
              <span className="input-group-addon">{ this.props.pricing.price.currency }</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  private onAmountChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.props.onChange({
      ...this.props.pricing,
      price: {
        ...this.props.pricing.price,
        amount: parseInt(event.currentTarget.value)
      },
    });
  };

  private onFrequencyChange = (frequency: Common.PricingFrequency) => {
    this.props.onChange({
      ...this.props.pricing,
      frequency
    });
  };

  private onBlur = () => {
    this.setState({ amountInputHasBeenBlurred: true });
  };

  private isValueInvalid() {
    return (this.state.amountInputHasBeenBlurred || this.props.displayErrors) && (!this.props.pricing || !this.props.pricing.price || !this.props.pricing.price.amount);
  }

  public focus() {
    this.valueInput && this.valueInput.focus();
  }

}