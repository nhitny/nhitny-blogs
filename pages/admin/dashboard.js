import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "@/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "firebase/firestore";

export default function AdminDashboard() {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({
        title: "",
        description: "",
        content: "",
        slug: "",
        date: "",
        isPublished: false, // ✅ boolean
    });

    // Tạo slug từ title
    function generateSlug(title) {
        return title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9 ]/g, "")
            .trim()
            .replace(/\s+/g, "-");
    }

    const router = useRouter();

    // Kiểm tra đăng nhập
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/admin/login");
            }
        });
        return () => unsubscribe();
    }, []);

    // Lấy bài viết
    useEffect(() => {
        const fetchPosts = async () => {
            const querySnapshot = await getDocs(collection(db, "posts"));
            const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(postsData);
        };
        fetchPosts();
    }, []);

    // Thêm bài viết mới
    const handleAddPost = async (e) => {
        e.preventDefault();
        const { title, description, content, slug, date, isPublished } = newPost;
        try {
            await addDoc(collection(db, "posts"), {
                title,
                description,
                content,
                slug,
                date,
                isPublished, // ✅ lưu đúng kiểu
            });
            setNewPost({
                title: "",
                description: "",
                content: "",
                slug: "",
                date: "",
                isPublished: false,
            });
            alert("Đã thêm bài viết!");
            // reload danh sách
            const querySnapshot = await getDocs(collection(db, "posts"));
            const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(postsData);
        } catch (err) {
            console.error(err);
            alert("Có lỗi khi thêm bài viết");
        }
    };

    // Xóa bài viết
    const handleDeletePost = async (postId) => {
        try {
            await deleteDoc(doc(db, "posts", postId));
            setPosts(posts.filter(post => post.id !== postId));
        } catch (err) {
            console.error(err);
            alert("Có lỗi khi xóa bài viết");
        }
    };

    // Toggle Publish
    const handleTogglePublish = async (postId, currentStatus) => {
        try {
            await updateDoc(doc(db, "posts", postId), {
                isPublished: !currentStatus,
            });
            setPosts(posts.map(post =>
                post.id === postId ? { ...post, isPublished: !currentStatus } : post
            ));
        } catch (err) {
            console.error(err);
            alert("Lỗi khi toggle Publish");
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">Quản lý Bài Viết</h1>

            <form onSubmit={handleAddPost} className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Thêm Bài Viết Mới</h2>
                <input
                    placeholder="Tiêu đề"
                    value={newPost.title}
                    onChange={(e) => {
                        const title = e.target.value;
                        const slug = generateSlug(title);
                        setNewPost({ ...newPost, title, slug });
                    }}
                    className="w-full p-2 mb-4 border rounded"
                    required
                />

                <label className="flex items-center mb-4">
                    <input
                        type="checkbox"
                        checked={newPost.isPublished}
                        onChange={(e) => setNewPost({ ...newPost, isPublished: e.target.checked })}
                        className="mr-2"
                    />
                    Publish ngay?
                </label>

                <button
                    type="submit"
                    className="p-2 bg-blue-600 text-white rounded"
                >
                    Thêm bài viết
                </button>
            </form>

            <h2 className="text-2xl font-semibold mb-4">Danh sách Bài Viết</h2>
            {posts.map((post) => (
                <div key={post.id} className="border-b pb-4 mb-4">
                    <h3 className="font-semibold">{post.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                        Status: {post.isPublished ? "Published ✅" : "Draft 🚫"}
                    </p>
                    <button
                        onClick={() => handleTogglePublish(post.id, post.isPublished)}
                        className="p-2 bg-green-600 text-white rounded mr-2"
                    >
                        {post.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 bg-red-600 text-white rounded"
                    >
                        Xóa
                    </button>
                </div>
            ))}
        </div>
    );
}