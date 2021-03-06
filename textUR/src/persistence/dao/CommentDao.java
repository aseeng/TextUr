package persistence.dao;

import java.util.List;

import model.Comment;

public interface CommentDao extends Dao {

	public void save(Comment comment);

	public Comment findByPrimaryKey(Long id);
	
	public List<Comment> find(Long fileId);
	
	public List<Comment> findFromLine(Long fileId, Long line);

	public void delete(Long id);
}
