namespace BaseCore.Entities
{
    public class NewsArticle
    {
        public int Id { get; set; }
        public string Slug { get; set; } = "";
        public string Title { get; set; } = "";
        public string Summary { get; set; } = "";
        public string ImageUrl { get; set; } = "";
        public string Category { get; set; } = "";
        public string Season { get; set; } = "";
        public DateTime PublishedAt { get; set; }
        public bool IsFeatured { get; set; } = true;
    }
}
