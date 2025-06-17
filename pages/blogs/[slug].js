import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";

export default function BlogDetail() {
  const router = useRouter();
  const { slug } = router.query;

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);

  // Fetch bài viết và bình luận
  useEffect(() => {
    if (!slug) return;

    const fetchPostAndComments = async () => {
      try {
        // Fetch bài viết từ Firestore theo slug
        const postSnapshot = await getDocs(query(collection(db, "posts"), where("slug", "==", slug)));
        if (!postSnapshot.empty) {
          const postData = postSnapshot.docs[0]?.data();
          setPost(postData);
        } else {
          console.error("Không tìm thấy bài viết với slug:", slug);
        }

        // Fetch bình luận cho bài viết
        const commentSnapshot = await getDocs(query(collection(db, "comments"), where("postId", "==", slug)));
        const commentData = commentSnapshot.docs.map(doc => doc.data());
        setComments(commentData);

      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
      }
    };

    fetchPostAndComments();
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    const fetchLikes = async () => {
      const likeSnapshot = await getDocs(query(collection(db, "likes"), where("postId", "==", slug)));
      setLikes(likeSnapshot.size);
    };

    fetchLikes();
  }, [slug]);

  if (!post) return <p>Đang tải bài viết...</p>;

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <p className="text-sm text-gray-500">
        {/* Chuyển đổi date từ Firestore Timestamp thành Date */}
        {post.date?.toDate().toLocaleDateString()}
      </p>
      <div className="mb-6" dangerouslySetInnerHTML={{ __html: post.content }} />

      {/* Nút Like */}
      <div>
        <button
          onClick={() => alert("Like clicked")}
          className="p-2 bg-blue-500 text-white rounded mb-4"
        >
          {likes} Lượt thích
        </button>
      </div>

      {/* Bình luận */}
      <div>
        <h3 className="text-2xl font-semibold">Bình luận</h3>
        {comments.length === 0 ? (
          <p>Chưa có bình luận nào.</p>
        ) : (
          comments.map((comment, index) => (
            <div key={index} className="border-b pb-4 mb-4">
              <strong>{comment.userName}</strong>
              <p>{comment.content}</p>
              {/* Chuyển đổi createdAt từ Firestore Timestamp thành Date */}
              <small>{comment.createdAt?.toDate().toLocaleString()}</small>
            </div>
          ))
        )}

        {/* Form bình luận */}
        <div className="mt-4">
          <textarea
            placeholder="Viết bình luận..."
            className="w-full p-2 border rounded"
          ></textarea>
          <button
            className="mt-2 p-2 bg-blue-600 text-white"
          >
            Gửi bình luận
          </button>
        </div>
      </div>
    </div>
  );
}
