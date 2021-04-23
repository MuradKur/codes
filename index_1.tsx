import React from 'react';
import CacheService from 'helpers/services/CacheService';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Layout } from 'antd';
import { Route, Switch } from 'react-router-dom';
import { adminRoutes } from './routes/admin';
import { teacherRoutes } from './routes/teacher';
import { parentRoutes } from './routes/parent';
import * as courses from 'AdminAccount/Courses/routes';
import * as family from 'global/routes';

import {
  ROLE_TEACHER,
  ROLE_ADMIN,
  ROLE_TOP_MANAGER,
  ROLE_PARENT,
  ROLE_STUDENT,
  ROLE_TEACHER_ACCESS_INFO,
  ROLE_CONTRACT_INFO_EDIT,
  ROLE_BRANCH_OPERATION_DEPARTAMENT_MANAGER
} from 'global/roles';
import { User } from 'types/user';
import { RouteProps } from 'react-router-dom';
import { History, Location } from 'history';
import { hasRole } from 'helpers';
import { Lesson } from 'AdminAccount/Courses';
import { BASE_HOMEWORK } from 'Student&ParentAccount/routes';
import Children from 'People/Families/Children';
import { Header } from 'Header';
import { LeftMenu } from 'LeftMenu';
import { Home } from 'Home';
import { NotFound } from 'Errors/404';
import { Forbidden } from 'Errors/403';
import { PrivateRoute } from './PrivateRoute';
import { UploadHomework } from 'Student&ParentAccount/Homework';

const cacheService = new CacheService();
const { Content } = Layout;
const StyledContent = styled(Content)`
  margin: 65px 0 20px 220px;
  overflow-x: initial;
  width: 100%;

  @media only screen and (max-height: 667px) {
    margin-top: 80px;
  }
  @media (max-width: 991px) {
    table {
      min-width: 960px;
    }
  }

  @media (max-width: 576px) {
    margin-left: 20px;
  }

  table {
    overflow-x: scroll;
  }
`;

const mapStateToProps = (state: any) => ({
  user: state.auth.user
});

interface RootProps {
  user: User;
  history: History;
  location: Location;
}

// В этом компоненте работай очень внимательно !

/**
 * @description Корневой компонент для формирования роутов, меню, контента.
 * @param {props} props - component props
 * @return {React.ReactNode}
 */
const RootTemplate = (props: RootProps) => {
  const { user, history, location } = props;
  let routes: RouteProps[] = [];
  const userFromCache = cacheService.getFromCache('user');
  const { roles } = userFromCache || user;

  // Учитель
  const hasTeacher = hasRole(user, [ROLE_TEACHER, ROLE_TEACHER_ACCESS_INFO]);

  // Админ
  const hasAdmin = hasRole(user,
    [
        ROLE_ADMIN,
        ROLE_TOP_MANAGER,
        ROLE_CONTRACT_INFO_EDIT,
        ROLE_BRANCH_OPERATION_DEPARTAMENT_MANAGER
    ]);

  // Родитель или Студент
  const hasParentOrStudent = hasRole(user, [ROLE_PARENT, ROLE_STUDENT]);

  // Если в массиве ролей текущего пользователя содержится учитель
  if (roles && hasTeacher) {
    routes = teacherRoutes;
  }

  // Если в массиве ролей текущего пользователя содержатся админ или топ менеджер
  if (roles && hasAdmin) {
    routes = adminRoutes;
  }

  // Если в массиве ролей текущего пользователя содержатся родитель или студент
  if (roles && hasParentOrStudent) {
    routes = parentRoutes;
  }

  /**
   * @description Функция для распределения маршрутов, которые могут быть использованны в разных ЛК
   * @return {array}
   */
  const getGlobalRoutesByRoles = (): React.ReactElement[] => {

    const list: React.ReactElement[] = [
      <Route path="/" component={Home} exact key="home" />,
      <Route component={Forbidden} path="/forbidden" key="forbidden" exact />,
      <Route component={NotFound} key="not-found" />
    ];

    // Страница курсов и студента может быть доступна и учителю и админу
    if (hasAdmin || hasTeacher) {
      list.unshift(
        ...[
          <Route path={courses.LESSON} component={Lesson} key="lesson" exact />,
          <Route path={family.BASE_STUDENT} component={Children} key="student" exact />
        ]
      );
    }

    // Домашку видят все
    list.unshift(...[<Route path={BASE_HOMEWORK} component={UploadHomework} key="homework" exact />]);
    return list;
  };

  return (
    <Content>
      <Header history={history} location={location} />
      <Layout>
        <LeftMenu />
        <StyledContent>
          <Switch>
            {routes.map((route, index) => (
              <PrivateRoute {...route} key={index} />
            ))}
            {getGlobalRoutesByRoles()}
          </Switch>
        </StyledContent>
      </Layout>
    </Content>
  );
};

export const Root = connect(mapStateToProps)(RootTemplate);

export default { Root };
