import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import * as Sentry from '@sentry/browser';
import { IntlProvider } from 'react-intl';
import * as auth from './Auth/routes';
import { getUserInfo } from './Auth/actions';
import { Layout, Result } from 'antd';
import { GlobalStyle } from './global/GlobalStyle';
import PageBackground from './img/ami-branch.png';
import { PrivateRoute } from './Root/PrivateRoute';
import { getGlobalCollections } from './global/actions';
import { LANGUAGES } from 'global/constants';
import AuthService from './helpers/services/AuthService';
import { hasRole, isLocalLaunch } from './helpers';
import { Root } from './Root';
import { Auth } from './Auth';
import { User } from './types/user';
import { i18n, context } from './i18n';
import { LastLocationProvider } from 'react-router-last-location';
import { Message } from 'global/components/OldDesignMessage';
import { ROLE_ADMIN, ROLE_TEACHER } from './global/roles';
import ExternalCodeService from 'helpers/services/ExternalCodeService';


const externalCodeService = new ExternalCodeService();
const LayoutStyles = { backgroundColor: 'transparent' };
const Forgot = () => <Auth isForgot={true} />;

interface AppProps {
  getCurrentUserInfo: () => void;
  getGlobalCollections: () => void;
  user: User;
  intl?: any;
}

interface AppState {
  hasError: boolean;
  error: null | object;
  language: string;
  hasGetGlobalCollections: boolean;
}

/**
 * @description Корневой компонент
 * @return {React.ReactNode}
 */
class App extends React.PureComponent<AppProps, AppState> {
  state = {
    hasError: false,
    error: null,
    language: 'en-US',
    hasGetGlobalCollections: false
  };

  /**
   * @param {object} error
   * @return {void}
   */
  static getDerivedStateFromError(error): object {
    return { hasError: true, error: error };
  }

  /**
   * @param {error} error
   * @param {string} errorInfo
   * @return {void}
   */
  componentDidCatch(error, errorInfo): void {
    if (!isLocalLaunch) {
      Sentry.withScope(scope => {
        Object.keys(errorInfo).forEach(key => {
          scope.setExtra(key, errorInfo[key]);
        });
        Sentry.captureException(error);
      });
    }
  }

  /**
   * @description Если в componentDidMount не загрузились глобальные коллекции(когда в componentDidMount юзер еще не авторизовался)
   * @return {void}
   */
  componentDidUpdate(prevProps: Readonly<AppProps>, prevState: Readonly<AppState>): void {
    const { getGlobalCollections, user } = this.props;
    if (!this.state.hasGetGlobalCollections && hasRole(user, [ROLE_ADMIN, ROLE_TEACHER])) {
      getGlobalCollections();
      this.setState({
        hasGetGlobalCollections: true
      });
    }
  }

  /**
   * @return {Promise<any>}
   */
  async componentDidMount(): Promise<any> {
    const { getCurrentUserInfo, getGlobalCollections, user } = this.props;

    if (AuthService.loggedIn()) {
      await getCurrentUserInfo();

      // Получение глобальных коллекций

      // Глобальные коллекции НЕ админу не нужны
      if (hasRole(user, [ROLE_ADMIN, ROLE_TEACHER])) {
        getGlobalCollections();
        this.setState({
          hasGetGlobalCollections: true
        });
      }

      // Языковые настройки. По умолчанию установлен английский.
      const localLanguage = localStorage.language;
      // Проверка на наличие доступного языка в кэше
      this.setState({ language: LANGUAGES.includes(localLanguage) ? localLanguage : 'en-US' });

      context.subscribe('changeLanguage', ({ language }) => {
        this.setState({
          language
        });

        // Сохранить язык в текущей сессии
        localStorage.setItem('language', language);
      });
    }
  };

  render() {
    const { hasError, language } = this.state;

    return (
      <IntlProvider locale={language} messages={i18n[language]}>
        {externalCodeService.getYandexMetricaCounter()}
        <Message user={this.props.user} />
        {hasError ? (
          <Result
            style={{ marginTop: 150 }}
            status="error"
            title="Sorry, App error :("
            subTitle="An error has occurred in the application. We already know about it. Try later"
          />
        ) : (
          <Layout style={LayoutStyles}>
            <GlobalStyle background={PageBackground} />
            <BrowserRouter>
              <LastLocationProvider>
                <Switch>
                  <Route path={auth.AUTH_FORGOT} component={Forgot} />
                  <Route path={auth.BASE_AUTH} component={Auth} />
                  <PrivateRoute component={Root} />
                </Switch>
              </LastLocationProvider>
            </BrowserRouter>
          </Layout>
        )}
      </IntlProvider>
    );
  }
}

const mapStateToProps = (state: any) => ({
  user: state.auth.user
});

const mapDispatchToProps = (dispatch: any) => ({
  getGlobalCollections: () => {
    dispatch(getGlobalCollections());
  },
  getCurrentUserInfo: () => {
    dispatch(getUserInfo());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(hot(App));
