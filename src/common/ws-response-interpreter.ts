export class WSCloseEventTransformer {
  Message: string;
  Code: number;
  Reason: string;

  constructor(event: CloseEvent) {
    this.Message = this.closeCodeConvertor(event.code);
    this.Code = event.code;
    this.Reason = event.reason || '';
  }

  private closeCodeConvertor(code: number): string {
    // ref: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
    switch (code) {
      case 1000:
        return 'Normal Closure';
      case 1001:
        return 'Going Away';
      case 1002:
        return 'Protocol error';
      case 1003:
        return 'Unsupported Data';
      case 1004:
        return 'Reserved';
      case 1005:
        return 'No Status Rcvd';
      case 1006:
        return 'Abnormal Closure';
      case 1007:
        return 'Invalid frame payload data';
      case 1008:
        return 'Policy Violation';
      case 1009:
        return 'Message Too Big';
      case 1010:
        return 'Mandatory Ext.';
      case 1011:
        return 'Internal Error';
      case 1012:
        return 'Service Restart';
      case 1013:
        return 'Try Again Later';
      case 1014:
        return 'Bad Gateway';
      case 1015:
        return 'TLS handshake';
      case 3000:
        return 'Unauthorized'; // custom code defined for application scope
    }
    return '';
  }
}
