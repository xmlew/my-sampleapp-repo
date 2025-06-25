import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-24">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">OpenAI Chat Assistant</h1>
        <ChatInterface />
      </div>
    </main>
  );
}
