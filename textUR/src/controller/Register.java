package controller;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.sun.org.apache.xerces.internal.impl.xpath.regex.ParseException;

import model.User;
import persistence.DAOFactory;
import persistence.dao.UserDao;

@SuppressWarnings("serial")
public class Register extends HttpServlet {

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

		String username = req.getParameter("username");
		String mail = req.getParameter("email");
		String password = req.getParameter("password");
		String image = req.getParameter("image");
		
		UserDao userDao = DAOFactory.getInstance().getUserDao();

		if (userDao.findByPrimaryKey(username) != null) {
			resp.getWriter().print("exist");
			return;
		}
		else if (userDao.findByMail(mail) != null) {
			resp.getWriter().print("email_exist");
			return;
		}
		else {
			try {
				User user = new User(username, mail, image);
				userDao.save(user);
				userDao.setPassword(user, "", password);

			} catch (ParseException e) {
				e.printStackTrace();
			}
		}
	}
}
