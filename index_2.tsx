import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Icon, Layout, Menu } from 'antd';
import styled from 'styled-components';
import { FeedbackModal } from './Feedback';
import { menu } from './menu';
import { menuListForAdmin } from 'AdminAccount/menuList';
import { menuListForAcademicExpert } from 'AdminAccount/AcademicExpert/menuList';
import { menuListForTeacher } from 'TeacherAccount/menuList';
import { menuListForPeople } from 'Student&ParentAccount/menuList';
import {
  ROLE_TEACHER,
  ROLE_ADMIN,
  ROLE_TOP_MANAGER,
  ROLE_PARENT,
  ROLE_STUDENT,
  ROLE_ACADEMIC_EXPERT,
  ROLE_BRANCH_OPERATION_DEPARTAMENT_MANAGER,
  ROLE_BRANCH_DIRECTOR
} from 'global/roles';
import CacheService from '../helpers/services/CacheService';
import { User } from 'types/user';
import { hasRole } from '../helpers';
import { useIntl } from 'react-intl';

const cacheService = new CacheService();

const { Sider } = Layout;

const StyledSider = styled(Sider)`
  position: fixed;
  height: calc(100% - 65px);
  top: 65px;
  z-index: 1000;
`;

/**
 * @param {object} state
 * @return {object} user
 */
const mapStateToProps = (state: any) => ({
  user: state.auth.user
});

interface LeftMenuProps {
  user: User;
}

/**
 * @description Компонент левого меню
 * @param {object} user
 * @return {React.ReactNode}
 */
export const LeftMenu = connect(mapStateToProps)((props: LeftMenuProps) => {
  const { user } = props;
  let list: Array<any> = [];
  const userFromCache = cacheService.getFromCache('user');
  const { roles }: any = userFromCache || user;
  const [showFeedBack, setFeedBackShow] = useState<boolean>(false);
  const showFeedBackModal = () => setFeedBackShow(true);
  const hideShowModal = () => setFeedBackShow(false);
  const [width, setWidth] = useState<number>(0);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const onCollapse = (collapse: boolean) => setCollapsed(collapse);
  const handleClick = () => (width <= 576 ? setCollapsed(true) : null);
  const intl = useIntl();

  // Если в массиве ролей текущего пользователя содержится учитель
  if (roles && hasRole(user, [ROLE_TEACHER])) {
    list = menuListForTeacher(intl, user);
  }

  // Если в массиве ролей текущего пользователя содержатся админ или топ менеджер
  if (
    roles &&
    hasRole(user, [ROLE_ADMIN, ROLE_TOP_MANAGER, ROLE_BRANCH_OPERATION_DEPARTAMENT_MANAGER, ROLE_BRANCH_DIRECTOR])
  ) {
    list = menuListForAdmin(user);
  }

  // Если роль академик эксперт
  if (roles && hasRole(user, [ROLE_ACADEMIC_EXPERT])) {
    list = menuListForAcademicExpert();
  }

  // Если в массиве ролей текущего пользователя содержатся родитель или студент
  if (roles && hasRole(user, [ROLE_PARENT, ROLE_STUDENT])) {
    const hasStudent = hasRole(user, [ROLE_STUDENT]);
    list = menuListForPeople(intl, hasStudent, user?.branch);
  }

  useEffect(() => {
    setWidth(window.innerWidth);
  }, [width, window.innerWidth]);

  return (
    <StyledSider
      onCollapse={onCollapse}
      width={220}
      collapsed={collapsed}
      theme="dark"
      breakpoint="sm"
      collapsedWidth="0"
    >
      <Menu theme="dark" mode="vertical" defaultSelectedKeys={['']} onClick={handleClick}>
        {menu(list)}
        <Menu.Item key="33" onClick={showFeedBackModal}>
          <Icon type="smile" />
          <span>{intl.formatMessage({ id: 'feedback' })}</span>
        </Menu.Item>
        <FeedbackModal hide={hideShowModal} show={showFeedBack} />
      </Menu>
    </StyledSider>
  );
});

export default { LeftMenu };
