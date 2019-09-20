export default interface ConsoleFramePresenter {
  initialize(): void;

  setHeight(height: number): void;
  blur(): void;
  focus(): void;
}

export class ConsoleFramePresenterImpl implements ConsoleFramePresenter {
  initialize(): void {
    let iframe = document.createElement('iframe');
    iframe.src = browser.runtime.getURL('build/console.html');
    iframe.id = 'vimvixen-console-frame';
    iframe.className = 'vimvixen-console-frame';
    document.body.append(iframe);
  }

  setHeight(height: number): void {
    let ele = document.getElementById('vimvixen-console-frame');
    if (!ele) {
      throw new Error('console frame not created');
    }
    ele.style.height=height+'px';
  }

  blur(): void {
    let ele = document.getElementById('vimvixen-console-frame');
    if (!ele) {
      throw new Error('console frame not created');
    }
    ele.blur();
    ele.style.height='0%';
  }

  focus(): void {
    let ele = document.getElementById('vimvixen-console-frame');
    if (!ele) {
      throw new Error('console frame not created');
    }
    ele.style.height='100%';
  }
}
