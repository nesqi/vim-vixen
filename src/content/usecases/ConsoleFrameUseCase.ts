import { injectable, inject } from 'tsyringe';
import ConsoleFramePresenter from '../presenters/ConsoleFramePresenter';

@injectable()
export default class ConsoleFrameUseCase {
  constructor(
    @inject('ConsoleFramePresenter')
    private consoleFramePresenter: ConsoleFramePresenter,
  ) {
  }

  unfocus() {
    window.focus();
    this.consoleFramePresenter.blur();
  }

  focus() {
    this.consoleFramePresenter.focus();
  }
}
