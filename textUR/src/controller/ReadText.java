package controller;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import model.File;
import model.User;
import persistence.DAOFactory;
import persistence.dao.FileDao;

@SuppressWarnings("serial")
public class ReadText extends HttpServlet {

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

		HttpSession session = req.getSession();
		File file = (File) session.getAttribute("file");
		User user = (User) session.getAttribute("user");
		FileDao fileDao = DAOFactory.getInstance().getFileDao();

		if(file == null || user == null)
			return;

		if(file.getUser() == null || !file.getUser().getUsername().equals(user.getUsername()))
		{
			File file1 = fileDao.findCode(file.getId());
			resp.getWriter().print("lock" + file1.getCode());
			session.setAttribute("file", file1);
		}		
		
	}
}
