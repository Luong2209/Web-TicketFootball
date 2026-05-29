namespace BaseCore.Entities
{
    public class Payment
    {
        public int Id { get; set; }
        public int TicketOrderId { get; set; }
        public string PaymentCode { get; set; } = "";
        public string Method { get; set; } = "";
        public string Provider { get; set; } = "";
        public string Status { get; set; } = "Pending";
        public decimal Amount { get; set; }
        public string TransactionId { get; set; } = "";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaidAt { get; set; }

        public TicketOrder TicketOrder { get; set; }
    }
}
