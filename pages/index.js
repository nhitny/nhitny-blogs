import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig"; // Import Firestore config
import { collection, getDocs } from "firebase/firestore"; // Các method Firestore

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      // Lấy danh sách bài viết từ Firestore
      const querySnapshot = await getDocs(collection(db, "posts"));
      const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData); // Cập nhật state với dữ liệu lấy được
    };

    fetchPosts();
  }, []); // Dùng useEffect để gọi fetch khi component mount

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Danh sách bài viết</h1>
      <div>
        {posts.length === 0 ? (
          <p>Đang tải bài viết...</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="mb-4 border-b pb-4">
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-sm text-gray-500">{post.description}</p>
              <a href={`/blogs/${post.slug}`} className="text-blue-600">Đọc tiếp</a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


