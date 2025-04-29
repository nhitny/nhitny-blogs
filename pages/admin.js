import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, addDoc, deleteDoc } from "firebase/firestore";

export default function Admin() {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({
        title: "",
        description: "",
        content: "",
        slug: "",
        date: "",
    });
    const [user, setUser] = useState(null);  // Lưu thông tin người dùng
    const router = useRouter();

    useEffect(() => {
        // Kiểm tra trạng thái người dùng đăng nhập
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/admin/login");  // Nếu chưa đăng nhập, redirect về trang login
            } else {
                setUser(user);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            const querySnapshot = await getDocs(collection(db, "posts"));
            const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(postsData);
        };
        fetchPosts();
    }, []);

    // Handle form submission to add a new post
    const handleAddPost = async (e) => {
        e.preventDefault();
        const { title, description, content, slug, date } = newPost;
        try {
            await addDoc(collection(db, "posts"), { title, description, content, slug, date });
            setNewPost({
                title: "",
                description: "",
                content: "",
                slug: "",
                date: "",
            });
            alert("Bài viết đã được thêm thành công!");
        } catch (error) {
            alert("Có lỗi khi thêm bài viết!");
        }
    };

    // Handle delete post
    const handleDeletePost = async (postId) => {
        try {
            await deleteDoc(doc(db, "posts", postId));
            setPosts(posts.filter(post => post.id !== postId));
            alert("Bài viết đã được xóa thành công!");
        } catch (error) {
            alert("Có lỗi khi xóa bài viết!");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-4xl font-bold mb-6">Quản lý Bài Viết</h1>

            {/* Form để thêm bài viết mới */}
            <form onSubmit={handleAddPost} className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Thêm Bài Viết Mới</h2>
                <input
                    type="text"
                    placeholder="Tiêu đề bài viết"
                    className="w-full p-2 mb-4 border rounded"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    required
                />
                <button type="submit" className="p-2 bg-blue-600 text-white rounded">
                    Thêm bài viết
                </button>
            </form>

            {/* Hiển thị danh sách bài viết */}
            <h2 className="text-2xl font-semibold mb-4">Danh sách Bài Viết</h2>
            {posts.map((post) => (
                <div key={post.id} className="border-b pb-4 mb-4">
                    <h3 className="font-semibold">{post.title}</h3>
                    <p>{post.description}</p>
                    <button
                        onClick={() => handleDeletePost(post.id)}
                        className="mt-2 p-2 bg-red-600 text-white rounded"
                    >
                        Xóa bài viết
                    </button>
                </div>
            ))}
        </div>
    );
}
