// pages/index.js

export async function getServerSideProps() {
    return {
        redirect: {
            destination: "/blogs",
            permanent: false, // false = redirect tạm thời, true = redirect vĩnh viễn (301)
        },
    };
}

export default function Home() {
    // Không cần render gì, vì đã redirect
    return null;
}
