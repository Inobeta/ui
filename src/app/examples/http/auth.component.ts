import { Component, OnInit } from '@angular/core';
import { ibAuthActions } from '../../inobeta-ui/http/store/session/actions';
import { IbAPITokens, IbSession } from 'src/app/inobeta-ui/http/auth/session.model';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-http-auth',
  template: `
<div style="padding: 20px;">

  Insert access token
  <textarea #token></textarea>
  <button (click)="executeAuth(token.value)">apply</button>


  <div *ibRoleCheck="['admin', 'user']">
    rendered if role is admin or user
  </div>


  <div *ibRoleCheck="['supervisor', 'worker']">
    rendered if role is supervisor or worker
  </div>


  <div *ibRoleCheck="['admin', 'worker']">
    rendered if role is admin or worker
  </div>
</div>


  `
})

export class AuthExampleComponent implements OnInit {
  constructor(private store: Store) { }

  ngOnInit() { }

  executeAuth(accessToken: string){
    const activeSession =  new IbSession<IbAPITokens>();
    activeSession.valid = true;
    activeSession.user = {
      email: 'pippuzzu@inobeta.net',
      password: '',
      rememberMe: false
    }
    activeSession.serverData = {
      accessToken,
      refreshToken: ''
    }
    this.store.dispatch(ibAuthActions.login({activeSession: activeSession}))
  }
}
